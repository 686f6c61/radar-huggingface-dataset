# miesdevries/stay4s-cyc7-q4

## Resumen

Stay4S Cyc7 SFT Q4 es un modelo de lenguaje en neerlandés publicado por el usuario miesdevries (Het Nieuwe Begin BV, Mitchell de Vries) dentro del ecosistema Stay4S, presentado por su autor como un ecosistema de IA neerlandés, autohospedado y sin dependencia de grandes tecnológicas. El repositorio contiene una séptima iteración («cyclus 7») de un proceso de ajuste supervisado (SFT) sobre un modelo base de la familia Llama, distribuida únicamente en formato GGUF con cuantización Q4_K_M.

El modelo cuenta con 1.673.889.792 parámetros totales (aproximadamente 1,67 mil millones), lo que lo sitúa en la gama pequeña y permite su ejecución en hardware de consumo e incluso en CPU. El repositorio ocupa 1,0 GB y el archivo cuantizado se describe en la model card como de 976 MB. Está especializado en neerlandés (etiqueta `nl`) y su licencia es `other`, con términos no detallados en la documentación disponible.

Su relevancia actual reside en el nicho de modelos pequeños, soberanos y desplegables en local para aplicaciones en neerlandés con requisitos de privacidad, aunque la información pública es muy escasa: no se documentan datos de entrenamiento, longitud de contexto, benchmarks ni condiciones concretas de licencia, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (según las etiquetas del repositorio; no confirmado en la model card) |
| Parametros totales | 1.673.889.792 (≈1,67 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repositorio solo distribuye esta cuantización |
| Idiomas soportados | Neerlandés (`nl`) |
| Licencia | `other` (licencia personalizada; términos no especificados en la información disponible) |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 1,0 GB (archivo Q4_K_M descrito como 976 MB) |
| Fecha de creación | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas del repositorio incluyen `llama`, lo que apunta a un transformer decoder-only de la familia Llama, pero no se especifica la variante exacta, el número de capas, la dimensión oculta, el número de cabezas de atención ni el mecanismo de atención empleado. Tampoco se detalla si se aplicaron técnicas adicionales como atención lineal, decodificación especulativa o variantes híbridas.

En cuanto al entrenamiento, la única información disponible es que se trata de un ajuste supervisado (SFT) correspondiente al «ciclo 7» de un proceso iterativo, y que el autor lo describe como una mejora respecto al «ciclo 6». No se publican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni los hiperparámetros del ajuste. Tampoco se indica sobre qué modelo base concreto se realizó el SFT ni si se emplearon adaptadores LoRA, aunque la instrucción de uso de Ollama (`ollama run stay4s-lora`) sugiere que el ciclo original pudo partir de un adaptador LoRA.

## Capacidades

La información disponible no permite confirmar capacidades específicas más allá de la generación de texto en neerlandés. A partir de los datos del repositorio y del tamaño del modelo se puede indicar lo siguiente:

- Generación de texto en neerlandés: es el único idioma declarado explícitamente.
- Ajuste por instrucciones (SFT): el nombre del repositorio indica un ajuste supervisado orientado a instrucciones, si bien no se documentan los formatos de prompt ni de plantilla de chat.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo se declara neerlandés.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con la infraestructura de endpoints de Hugging Face, aunque no se detallan las condiciones.

## Casos de uso

Dado el tamaño reducido (≈1,67 mil millones de parámetros), la cuantización Q4_K_M y el enfoque en neerlandés, los escenarios realistas son los siguientes:

- Asistencia en neerlandés en local: despliegue en una estación de trabajo o servidor propio para tareas de redacción, resumen y respuesta a preguntas en neerlandés sin enviar datos a servicios externos. El tamaño del modelo permite ejecutarlo incluso en CPU.
- Atención al cliente de pymes neerlandesas: generación de respuestas en neerlandés para formularios de contacto, correo electrónico o chat, con la ventaja de poder alojarse en infraestructura propia y cumplir con requisitos de residencia de datos.
- Procesamiento de documentación administrativa: resumen y extracción de información de textos neerlandeses (contratos, comunicaciones oficiales, normativa) en un flujo por lotes, ejecutable en hardware modesto.
- Despliegue en el borde (edge): integración en dispositivos con recursos limitados, como mini-PC o Raspberry Pi con suficiente memoria, para asistentes de texto sin conectividad.
- Base para ajuste adicional: al ser un modelo pequeño y cuantizado, sirve como punto de partida para nuevos ciclos de SFT o para la creación de adaptadores LoRA específicos de dominio en neerlandés.
- Prototipado rápido de aplicaciones de IA generativa: por su bajo coste de inferencia, es adecuado para validar pipelines de generación en neerlandés antes de escalar a modelos mayores.
- Filtrado y clasificación de textos neerlandeses: uso como clasificador de intención o de temática en canales de soporte, donde el coste por inferencia es crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y los resultados de búsqueda web proporcionados no aportan datos de rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada: el archivo cuantizado Q4_K_M ocupa aproximadamente 976 MB, por lo que la inferencia requiere del orden de 1-2 GB de memoria para los pesos, más el espacio de la caché KV (dependiente de la longitud de contexto, que no se especifica).
- GPU recomendadas: no se publican recomendaciones oficiales. Por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente, incluidas tarjetas de gama de entrada.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en GPU de consumo (por ejemplo, series GTX 10xx en adelante con 4 GB o más, RTX 3050/3060 y superiores). También puede ejecutarse en CPU.
- Opciones de despliegue: la model card menciona Ollama (`ollama run stay4s-lora`). Al distribuirse en GGUF, es compatible con llama.cpp y con los runners basados en él; la etiqueta `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

El modelo se encuadra en la categoría de modelos pequeños (1-2 mil millones de parámetros) orientados a un idioma concreto. La comparación con alternativas conocidas es estructural, ya que no hay datos de rendimiento del modelo evaluado.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stay4S Cyc7 SFT Q4 | ≈1,67 mil millones | no disponible | Neerlandés | `other` (términos no detallados) | GGUF, Ollama |
| Qwen2.5-1.5B | ≈1,5 mil millones | 32K nativo (ampliable con RoPE/YaRN) | Multilingüe | Apache 2.0 (variantes) | Múltiples formatos, amplia adopción |
| Llama 3.2 1B | ≈1,2 mil millones | 128K | Multilingüe | Licencia comunitaria de Llama | Múltiples formatos, amplia adopción |
| SmolLM2-1.7B | ≈1,7 mil millones | 8K | Principalmente inglés | Apache 2.0 | Múltiples formatos |

Nota: los datos de los modelos comparativos corresponden a especificaciones públicas habituales y pueden variar según la variante concreta. No se dispone de comparaciones de rendimiento entre Stay4S Cyc7 y estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgos ni de alineación. Un ajuste SFT sobre un modelo base pequeño puede heredar sesgos del corpus de entrenamiento, no especificado.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad. En modelos de este tamaño el riesgo de generar información incorrecta con aparente seguridad es elevado, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: solo se declara neerlandés; no hay información sobre la longitud de contexto soportada, lo que impide planificar aplicaciones con documentos largos.
- Restricciones de licencia: la licencia figura como `other` y los términos no están detallados en la model card ni en la información disponible, por lo que el uso comercial requiere verificación previa con el autor o con Het Nieuwe Begin BV.
- Documentación insuficiente para producción: no se especifican el modelo base, el dataset, los hiperparámetros ni la plantilla de prompt, lo que dificulta la reproducibilidad y la integración fiable en sistemas en producción.
- Madurez del repositorio: cero descargas y cero valoraciones en el momento de la consulta, sin historial de mantenimiento más allá de la fecha de publicación.
- Formato único: solo se distribuye la cuantización Q4_K_M, sin versiones en precisión completa ni otros niveles de cuantización, lo que limita el ajuste fino de la relación calidad/coste.
- Cifras dispares: los parámetros notificados provienen de un recuento sobre safetensors, mientras que el artefacto distribuido es GGUF cuantizado; conviene verificar la equivalencia exacta entre ambos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/miesdevries/stay4s-cyc7-q4
- Sitio web del ecosistema Stay4S: https://www.stay4s.com/
- Organización en GitHub: https://github.com/hetnieuwebeginbv-glitch
- Perfil de GitHub del autor: https://github.com/miesdevries
- Papers, blogs o demos adicionales: no disponible
