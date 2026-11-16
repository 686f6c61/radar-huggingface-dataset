# ggml-org-dev/small-test

## Resumen

`ggml-org-dev/small-test` es un modelo de lenguaje y visión (VLM) de aproximadamente 94,9 millones de parámetros, publicado por la organización `ggml-org-dev` como artefacto de prueba para la integración continua del servidor de llama.cpp. No se trata de un modelo destinado a producción, sino de una *fixture* de CI: un modelo deliberadamente pequeño que cubre las rutas de código críticas del servidor (chat, tool calling, OCR y borrador especulativo MTP) sin incurrir en costes de descarga o cómputo elevados.

El modelo deriva de `Serveurperso/small-test`, según declara la model card, y está construido sobre una base arquitectónica Qwen3.5. Se distribuye en formato GGUF, lo que lo hace directamente consumible por llama.cpp y por el ecosistema de herramientas compatible (Ollama, servidores OpenAI-compatible). Su licencia Apache 2.0 permite uso, modificación y redistribución sin restricciones prácticas.

Su relevancia es fundamentalmente instrumental: sirve como referencia para validar que el servidor de llama.cpp maneja correctamente conversaciones multi-turno, llamadas a herramientas, extracción de texto en imágenes y decodificación especulativa con cabezas MTP, todo ello en un único artefacto de 0,3 GB. Para desarrolladores que contribuyen a llama.cpp o que construyen herramientas sobre su API, este modelo permite reproducir pruebas de integración de forma barata y determinista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 con capacidades de visión (VLM) y cabeza MTP para decodificación especulativa |
| Parámetros totales | 94.871.984 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio se distribuye en GGUF; no se detallan los niveles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,3 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLM de ~95M de parámetros basado en Qwen3.5, con soporte para chat, tool calling, OCR y *MTP drafting* (Multi-Token Prediction, utilizado para decodificación especulativa). La combinación de una torre de visión con un transformer de lenguaje de pequeño tamaño permite cubrir en un solo artefacto las rutas de inferencia multimodal y de texto del servidor de llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones adicionales más allá de la mencionada cabeza MTP. El modelo base `Serveurperso/small-test` es la referencia para obtener la model card completa, los pesos originales y el pipeline de entrenamiento, según indica el propio autor.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a validar el endpoint de chat del servidor.
- Tool calling / function calling, con soporte para el formato de herramientas del servidor de llama.cpp.
- Procesamiento de imágenes y OCR (extracción de texto a partir de imágenes).
- Decodificación especulativa mediante cabeza MTP (*MTP drafting*), pensada para acelerar la generación.
- Integración con endpoints compatibles con la API de OpenAI (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Pruebas de integración continua de llama.cpp: el modelo actúa como *fixture* para verificar que el servidor arranca, carga el GGUF y responde a peticiones de chat sin consumir recursos significativos en el runner de CI.
- Validación de tool calling en el servidor: permite comprobar que el parser de llamadas a funciones, la serialización de argumentos y el bucle de respuesta funcionan correctamente con un modelo real y pequeño.
- Verificación de la ruta multimodal y OCR: sirve para probar la canalización de imágenes (preprocesado, tokenización visual, generación condicionada) en un entorno controlado y rápido.
- Pruebas de decodificación especulativa: al incluir una cabeza MTP, permite validar la lógica de *drafting* y aceptación de tokens del servidor sin necesidad de un modelo grande.
- Desarrollo de clientes y SDKs: un artefacto de 0,3 GB es ideal para que los desarrolladores de librerías cliente prueben la compatibilidad con la API de llama.cpp en local.
- Reproducción de incidencias: al ser determinista y ligero, facilita la creación de *repro cases* mínimos para bugs reportados en el servidor o en el cargador de GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoría de cuantizaciones; el repositorio completo ocupa 0,3 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU sin requisitos especiales.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en dispositivos de gama baja.
- Opciones de despliegue: llama.cpp (servidor y CLI), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso de uso.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto incluso en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ggml-org-dev/small-test | 94,9M | no disponible | Sí | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-VL-3B | ~3B | no disponible en esta ficha | Sí | Apache 2.0 | safetensors y GGUF |
| SmolVLM-256M | ~256M | no disponible en esta ficha | Sí | Apache 2.0 | safetensors y GGUF |
| Moondream2 | ~1,9B | no disponible en esta ficha | Sí | Apache 2.0 | safetensors |

La comparativa es orientativa: `small-test` no compite en calidad con estos modelos, sino que ocupa un nicho distinto como artefacto de prueba. Los datos de contexto y rendimiento de los modelos alternativos no se han verificado en la información proporcionada y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo de prueba, no de producción: su propósito declarado es servir como *fixture* de CI; no se ha evaluado su calidad en tareas reales.
- Sin datos de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni métricas de OCR que permitan estimar su rendimiento.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, idioma, cultura o dominio.
- Riesgo de alucinación: no cuantificado; por su tamaño, es previsible que sea alto en tareas abiertas.
- Idiomas soportados no documentados: no se garantiza cobertura multilingüe más allá de lo que herede del modelo base.
- Contexto no documentado: se desconoce la longitud máxima de secuencia, lo que impide planificar su uso en conversaciones largas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero al ser un artefacto de test no se recomienda su despliegue en producción.
- Dependencia del modelo base: cualquier cambio en `Serveurperso/small-test` puede afectar al comportamiento de esta *fixture*.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/small-test
- Modelo base y model card completa: https://huggingface.co/Serveurperso/small-test
- llama.cpp (servidor y runtime): https://github.com/ggml-org/llama.cpp
