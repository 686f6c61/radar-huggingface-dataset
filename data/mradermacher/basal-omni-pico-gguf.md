# mradermacher/basal-omni-pico-GGUF

## Resumen

Basal Omni Pico es un modelo de decisión tipada ("typed decisions") de aproximadamente 752 millones de parámetros, desarrollado originalmente por el usuario Remek y distribuido en formato GGUF por mradermacher. No es un modelo generativo de propósito general, sino un modelo orientado a tareas de clasificación y toma de decisiones con calibración, etiquetado explícitamente como "decision-model" y "classification". Su nombre y etiquetas sugieren un diseño para entornos de borde ("edge"), donde el tamaño reducido y la eficiencia de inferencia priman sobre la amplitud de capacidades.

La relevancia de esta ficha radica en que el repositorio es una cuantización estática del modelo base Remek/basal-omni-pico, publicada bajo licencia Apache 2.0 y con soporte para polaco e inglés. El autor de las cuantizaciones, mradermacher, es conocido por producir versiones GGUF de modelos para su uso con llama.cpp y herramientas compatibles, lo que facilita el despliegue local sin necesidad de GPU de gama alta.

No se dispone de información pública sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados en el modelo base. Los datos disponibles se limitan a la model card de la cuantización, los metadatos del repositorio y el recuento de parámetros de los safetensors del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | pl (polaco), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base Remek/basal-omni-pico en la documentación disponible. El recuento de parámetros (752.393.024) corresponde a los safetensors del modelo original, y el repositorio de cuantización no incluye detalles sobre número de capas, dimensión oculta, mecanismo de atención ni tipo de transformer. Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado.

La única información técnica relevante es la relativa al proceso de cuantización: mradermacher indica que se trata de cuantizaciones estáticas (no ponderadas con imatrix), generadas con un convert_type "hf" y una versión de cuantización 2, con tensores de salida cuantizados. No se han publicado cuantizaciones ponderadas por imatrix en el momento de la consulta.

## Capacidades

- Clasificación y toma de decisiones tipadas: el modelo está etiquetado como "typed-decisions" y "decision-making", lo que indica que su función principal es emitir decisiones estructuradas o clasificaciones, no texto libre genérico.
- Calibración: la etiqueta "calibration" sugiere que el modelo está diseñado para producir puntuaciones de confianza calibradas, útil en sistemas donde la incertidumbre debe ser cuantificable.
- Soporte multilingüe limitado: polaco e inglés.
- Orientado a edge: el tamaño reducido (menos de 800 M de parámetros) y las cuantizaciones de 0,5 a 1,6 GB permiten su despliegue en dispositivos con recursos limitados.
- Conversacional: la etiqueta "conversational" aparece en los metadatos, aunque no se detalla el formato de conversación soportado.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Clasificación de tickets de soporte en tiempo real: el modelo puede asignar categorías y prioridades a incidencias entrantes, con puntuaciones de confianza calibradas para derivar casos ambiguos a revisión humana.
- Enrutamiento de decisiones en sistemas de borde: al caber en cuantizaciones de menos de 1 GB, puede desplegarse en dispositivos con poca memoria para decidir rutas de procesamiento o activar acciones condicionales.
- Moderación de contenido ligera: clasificación de textos en polaco e inglés para detectar categorías predefinidas, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Filtrado previo en pipelines de datos: uso como clasificador de primera etapa para descartar o etiquetar grandes volúmenes de texto antes de pasarlos a modelos mayores.
- Sistemas de recomendación con decisiones discretas: selección entre un conjunto finito de acciones o categorías basada en el contexto de entrada, aprovechando la calibración para ponderar la confianza.
- Evaluación de riesgo en formularios o solicitudes: clasificación de solicitudes en niveles de riesgo o elegibilidad, con la posibilidad de ejecutarse en infraestructura sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB para cuantizaciones Q2_K a Q4_K_M; 0,7-0,9 GB para Q5_K_M a Q8_0; 1,6 GB para f16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas; una RTX 3060 o superior permite ejecutar f16 con holgura. Para despliegue en CPU, el modelo es viable en la mayoría de equipos modernos.
- Cabe en GPU consumer: sí, en todas las cuantizaciones, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (decisiones tipadas con calibración) en la documentación proporcionada. El repositorio relacionado mradermacher/CORe-Pico-V3-GGUF aparece en los resultados de búsqueda, pero no se han encontrado datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| basal-omni-pico-GGUF | 752 M | no disponible | Apache 2.0 | GGUF |
| CORe-Pico-V3-GGUF | no disponible | no disponible | no disponible | GGUF |
| Alternativas genericas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha documentado el comportamiento del modelo fuera de las tareas de clasificación y decisión; no debe asumirse capacidad generativa general.
- Riesgo de alucinación no evaluado: al no publicarse benchmarks ni evaluaciones, se desconoce su fiabilidad en dominios distintos al de entrenamiento.
- Cobertura lingüística limitada a polaco e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero al no conocerse la procedencia de los datos de entrenamiento del modelo base, persisten riesgos legales no cuantificados.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calibración de las decisiones, que es una de las características principales del modelo; se recomienda Q4_K_M o superior para tareas sensibles a la confianza.
- No hay información sobre sesgos conocidos, robustez ante entradas adversarias ni comportamiento en producción.
- El repositorio tiene 0 likes y 797 descargas, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/basal-omni-pico-GGUF
- Modelo base: https://huggingface.co/Remek/basal-omni-pico
- Página de descargas del autor: https://hf.tst.eu/model#basal-omni-pico-GGUF
- Repositorio relacionado: https://huggingface.co/mradermacher/CORe-Pico-V3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
