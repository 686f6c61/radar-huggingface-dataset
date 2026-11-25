# eteron/ZeroHero-ALFWorld-Dialogue-5.4M-PPO

## Resumen

ZeroHero-ALFWorld-Dialogue-5.4M-PPO es una política de agente entrenada mediante PPO (Proximal Policy Optimization) para el entorno ALFWorld-dialogue, una interfaz personalizada de peticiones públicas y preguntas a un operador. Lo desarrolla el autor `eteron` dentro del proyecto ZeroHero y se publica bajo licencia Apache-2.0. No es un modelo de chat de propósito general: es un checkpoint de política de inferencia diseñado para integrarse en un bucle de agente con un contrato de entrada y salida específico.

El modelo es deliberadamente pequeño: 5.426.816 parámetros en formato FP32 safetensors, con arquitectura de tipo transformer implementada con Hugging Face Transformers y etiquetada como `qwen3`. Parte de un modelo pequeño inicializado aleatoriamente, seguido de un preentrenamiento supervisado y un post-entrenamiento con PPO durante 600 ciclos de entrenamiento. El contexto, los datos de entrenamiento, el crítico y los estados del optimizador no se distribuyen.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una política de agente entrenada con RL para un entorno tipo ALFWorld, con envoltorio de agente incluido y ejemplos ejecutables. No debe evaluarse como un LLM generalista, sino como un componente de control dentro de un pipeline de agente con observaciones estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado `qwen3`, implementado con Hugging Face Transformers) |
| Parametros totales | 5.426.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32, solo politica) |

## Arquitectura y entrenamiento

La arquitectura es un transformer pequeño (5,4 M de parámetros) construido con Hugging Face Transformers y etiquetado como `qwen3`. El entrenamiento parte de una inicialización aleatoria de un modelo pequeño, seguida de un preentrenamiento supervisado y un post-entrenamiento con PPO a lo largo de 600 ciclos de entrenamiento. El checkpoint publicado contiene únicamente los pesos de la política en FP32; no se incluyen el crítico, los estados del optimizador, el código de entrenamiento ni los datos de entrenamiento.

La innovación técnica principal no está en la arquitectura, sino en el contrato de interfaz: el modelo requiere un envoltorio de agente (`agent.py`) que formatea las observaciones y parsea las respuestas, ya que ambos pasos forman parte de la interfaz de la política. El presupuesto exacto de entrenamiento y el contrato de entrada se almacenan en `agent_config.json` y `release_metadata.json`, y se conservan sumas de verificación de los tensores de origen, comprobándose igualdad exacta durante la exportación. El entorno de diálogo personalizado y el operador/oráculo no se distribuyen.

## Capacidades

- Generación de acciones de agente dentro del entorno ALFWorld-dialogue, a partir de observaciones estructuradas en formato JSON.
- Formulación de peticiones públicas y preguntas a un operador dentro del contrato de diálogo definido por el entorno.
- Ejecución de un bucle de decisión de un solo paso por invocación, con parseo de respuesta delegado al envoltorio del agente.
- Soporte de tool calling / function calling: no disponible como capacidad general; la interacción con el entorno se realiza mediante el contrato del agente.
- Soporte de agentes y razonamiento multi-paso: limitado al bucle externo que orquesta las llamadas sucesivas a la política.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: política entrenada con RL (PPO) para un entorno concreto; no incluye modo de razonamiento explícito, visión ni audio.

## Casos de uso

- Investigación en RL para agentes: reproducir el post-entrenamiento con PPO de una política pequeña sobre un entorno tipo ALFWorld-dialogue, usando los ejemplos ejecutables como punto de partida para experimentos propios.
- Referencia de línea base en entornos de diálogo con operador: comparar el comportamiento de una política entrenada con RL frente a políticas basadas en LLM zero-shot en tareas de petición pública y pregunta a operador.
- Pruebas de integración de contratos de agente: validar el formateo de observaciones y el parseo de respuestas en un pipeline propio, dado que el modelo exige el envoltorio `agent.py` para funcionar correctamente.
- Docencia y demostración de RL aplicado a agentes: ilustrar el ciclo completo observación-decisión-recompensa con un modelo de 5,4 M de parámetros que cabe en cualquier equipo y se ejecuta en CPU.
- Evaluación de robustez de políticas pequeñas: estudiar cómo varía la respuesta ante cambios en la numeración en tiempo de ejecución y en el muestreo de generación, tal como advierte la model card.
- Prototipado de entornos simulados propios: usar el modelo como política de referencia mientras se desarrolla un entorno de diálogo alternativo con un contrato de entrada compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las curvas numéricas del entrenamiento no se presentan como una evaluación held-out de esta release, y que el muestreo de generación y la numeración en tiempo de ejecución pueden alterar respuestas individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (5,4 M de parámetros equivalen a unos 21,7 MB de pesos); el consumo real vendrá dominado por el runtime de Transformers y el envoltorio del agente.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Hugging Face Transformers con el envoltorio `agent.py` proporcionado; el tag `text-generation-inference` y `endpoints_compatible` figura en los metadatos, pero no se documenta una configuración de servicio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroHero-ALFWorld-Dialogue-5.4M-PPO | 5,4 M | no disponible | PPO sobre entorno ALFWorld-dialogue | Apache-2.0 | Pesos de política |
| Políticas RL pequeñas para ALFWorld (referencias genéricas) | Variable | no disponible | RL sobre ALFWorld | Variable | no disponible |
| LLM generalistas para agentes (p. ej. Qwen3 pequeños) | Desde cientos de M | Variable | Preentrenamiento + post-entrenamiento | Variable | no disponible |

No se dispone de datos de rendimiento comparables publicados para este checkpoint ni de una evaluación held-out que permita una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general; usarlo fuera de su contrato de agente produce resultados no válidos.
- El entorno de diálogo personalizado, el operador/oráculo y el arnés de evaluación no se distribuyen, por lo que no es posible reproducir el entrenamiento ni evaluar de forma estandarizada.
- Solo soporta inglés.
- No se incluyen el crítico, los estados del optimizador ni los datos de entrenamiento.
- Las curvas de entrenamiento no constituyen una evaluación held-out de esta release; el muestreo y la numeración en tiempo de ejecución pueden cambiar respuestas individuales.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser una política de 5,4 M de parámetros, su capacidad de generalización es muy limitada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las dependencias del entorno y las observaciones de benchmarks públicos quedan sujetas a sus licencias originales, según `THIRD_PARTY_NOTICES.md`.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/eteron/ZeroHero-ALFWorld-Dialogue-5.4M-PPO
- Ejemplos de inferencia: `examples/infer.py` y `examples/README.md` dentro del repositorio
- Configuración del agente: `agent_config.json` y `release_metadata.json` dentro del repositorio
- Sumas de verificación: `SHA256SUMS` dentro del repositorio
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` dentro del repositorio
