# RKNNAI/RK3588-LLM-Qwen2.5-0.5B

## Resumen

RK3588-LLM-Qwen2.5-0.5B es una distribución de despliegue, no un modelo entrenado desde cero. El autor RKNNAI publica en HuggingFace una conversión y cuantización del modelo base Qwen/Qwen2.5-0.5B al formato RKLLM, pensada para ejecutarse sobre la NPU del SoC Rockchip RK3588. El repositorio incluye únicamente los artefactos de inferencia y la documentación de despliegue, con un tamano total de 0,8 GB.

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5, con aproximadamente 0,49 mil millones de parámetros. La conversión aplica cuantización de pesos y activaciones w8a8, emplea 3 núcleos de NPU y fija la ventana de contexto efectiva en 1024 tokens, muy por debajo de los 32 768 tokens que soporta el modelo original. Requiere la versión v1.2.4 del runtime RKLLM y está licenciado bajo Apache 2.0.

Su relevancia es práctica: permite ejecutar un LLM de forma local en placas de bajo coste como Orange Pi 5, Radxa Rock 5 o Khadas Edge2, sin GPU dedicada ni conexión a servicios en la nube. Está orientado a desarrolladores de sistemas embebidos y proyectos de IA en el borde que necesitan un modelo pequeno, determinista y offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5); convertido a formato RKLLM para NPU Rockchip |
| Parametros totales | ~0,49 B (modelo base Qwen2.5-0.5B) |
| Longitud de contexto | 1024 tokens en esta configuracion (modelo base: 32 768 tokens) |
| Tipos de cuantizacion | w8a8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (runtime v1.2.4); no safetensors ni GGUF |
| Chip objetivo | Rockchip RK3588 |
| Nucleos de NPU | 3 |
| Version de runtime RKLLM | v1.2.4 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). No se trata de un MoE ni de un modelo hibrido SSM. La informacion proporcionada no detalla el numero de capas, la dimension oculta ni la composicion del dataset de entrenamiento del modelo original; esos datos corresponden a la model card oficial de Qwen.

No hay entrenamiento adicional documentado en esta distribucion. El proceso aplicado es una conversion de formato y una cuantizacion a w8a8 mediante la cadena de herramientas RKLLM-Toolkit de Rockchip, que transforma los pesos originales en un artefacto compatible con la NPU. Tampoco se documentan fases de RLHF ni DPO en este repositorio. La innovacion tecnica relevante no está en el modelo, sino en la ruta de despliegue: compilar en el PC anfitrion, verificar los hashes SHA-256 y ejecutar en la placa mediante la API C de RKLLM.

## Capacidades

- Generacion de texto conversacional en el modelo base Qwen2.5-0.5B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo.
- Generacion de codigo sencillo, sin garantias de calidad en tareas complejas.
- Capacidades multilingues heredadas del modelo base (el chino y el ingles estan bien representados en la familia Qwen2.5; no se especifican idiomas exactos en esta ficha).
- Inferencia completamente offline sobre la NPU del RK3588, sin dependencia de servicios externos.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en esta configuracion.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistentes locales en dispositivos embebidos: un robot o panel industrial puede integrar el modelo sobre la NPU del RK3588 para responder ordenes en lenguaje natural sin conexion a internet y con latencia controlada.
- Procesamiento de texto en el borde: clasificacion, resumen o extraccion de campos en flujos de datos industriales que no pueden enviarse a la nube por motivos de privacidad o normativa.
- Prototipado rapido en IA embebida: sirve como primer modelo funcional para validar la cadena RKLLM-Toolkit antes de invertir en conversiones de modelos mayores como Qwen2.5-14B-Instruct-rk3588.
- Interfaces de voz sobre dispositivo: combinado con un motor de reconocimiento de voz local, permite construir asistentes conversacionales en placas tipo Orange Pi 5 o Radxa Rock 5.
- Automatizacion de documentacion tecnica en campo: tecnicos con dispositivos portatiles pueden generar borradores de informes o consultar procedimientos sin cobertura de red.
- Educacion y demostraciones: proyecto adecuado para talleres sobre despliegue de LLM en NPU, dado el bajo coste del hardware y la verificacion SHA-256 incluida.
- Sistemas de control domestico: interpretacion de comandos de texto cortos para domotica sobre hardware de gama baja y consumo reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- SoC objetivo: Rockchip RK3588 (NPU de 6 TOPS), con 3 nucleos de NPU asignados a esta configuracion.
- Memoria necesaria: el repositorio ocupa 0,8 GB; con la cuantizacion w8a8 el modelo en ejecucion requiere aproximadamente 1 GB de RAM/NPU compartida, por lo que encaja en placas con 4 GB o mas.
- GPU dedicada: no necesaria, el modelo no está pensado para CUDA. No se documenta soporte para A100, H100 ni RTX.
- Compatibilidad con GPU de consumo: no aplica, es una distribucion exclusiva para NPU Rockchip en este formato.
- Opciones de despliegue: runtime RKLLM v1.2.4 mediante la API C de RKLLM; alternativamente, el proyecto RKLLM_LLAMA_QWEN demuestra que se puede ejecutar Qwen en el RK3588 por CPU con llama.cpp fijado a los 4 nucleos Cortex-A76.
- Latencia y throughput: no disponibles. Dependen en gran medida del modelo concreto, de la version del runtime y del sistema de refrigeracion de la placa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / chip | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK3588-LLM-Qwen2.5-0.5B (RKNNAI) | ~0,49 B | 1024 | RKLLM / RK3588 | Apache 2.0 | HuggingFace y ModelScope |
| Qwen2.5-14B-Instruct-rk3588-1.1.1 (c01zaut) | 14 B | no disponible | RKLLM w8a8 / RK3588 | no disponible | HuggingFace |
| Qwen2.5-Omni-7B-rk3588-1.2.0 (imkebe) | 7 B | no disponible | RKLLM / RK3588 | no disponible | HuggingFace |

Los dos modelos comparables son conversiones a RKLLM de mayor tamano y capacidades multimodales, por lo que no son alternativas directas en coste de memoria: el modelo de 0,5 B es el unico de la comparativa que se ejecuta comodamente en placas con 4 GB de RAM y NPU de 6 TOPS. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto limitada a 1024 tokens, lo que restringe conversaciones largas y el analisis de documentos extensos.
- Modelo de 0,49 B: la calidad de razonamiento, la coherencia en cadenas largas y la generacion de codigo complejo son sensiblemente inferiores a las de modelos de 7 B o mas.
- Riesgo elevado de alucinacion en preguntas factuales, atribuible tanto al tamano reducido como al maximo de tokens disponible.
- La cuantizacion w8a8 puede degradar adicionalmente la precision respecto al modelo original en punto flotante.
- No se documentan sesgos especificos, pero el modelo base hereda los de su dataset de entrenamiento, no detallado aqui.
- La licencia Apache 2.0 permite uso comercial, siempre que se conserven los avisos de copyright originales incluidos en el fichero LICENSE.
- La distribucion solo cubre RK3588 y la version v1.2.4 del runtime RKLLM; no debe mezclarse con ficheros de otras configuraciones.
- No se garantiza funcionamiento fuera de la placa y la version de runtime indicadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-10-02) resulta atipica; conviene verificar la procedencia y la integridad de los ficheros con SHA256SUMS antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/RKNNAI/RK3588-LLM-Qwen2.5-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio oficial de RKLLM de Rockchip: https://github.com/airockchip/rknn-llm
- Proyecto RKLLM_LLAMA_QWEN (ejecucion en NPU y CPU): https://github.com/alebal123bal/RKLLM_LLAMA_QWEN
- Articulo de despliegue de Qwen2.5-0.5B en RK3588: https://pavelhan.tech/en/article/2026-03-16-the-Qwen2.5-0.5B-model-deployment-on-RK3588/
- Conversion comparable Qwen2.5-14B-Instruct-rk3588: https://huggingface.co/c01zaut/Qwen2.5-14B-Instruct-rk3588-1.1.1
- Conversion comparable Qwen2.5-Omni-7B-rk3588: https://huggingface.co/imkebe/Qwen2.5-Omni-7B-rk3588-1.2.0
