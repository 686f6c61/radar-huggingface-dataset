# kloodia/gemma-4-e4b-executorch

## Resumen

Gemma 4 E4B — ExecuTorch MLX es una conversión del decodificador de texto de google/gemma-4-E4B-it al formato ExecuTorch con backend MLX, pensada para ejecutarse en iOS dentro de React Native ExecuTorch. El artefacto lo publica el usuario kloodia en HuggingFace y no es un modelo entrenado desde cero: es un export empaquetado de un modelo base de Google, con las capas lineales cuantizadas a 4 bits y un grafo optimizado para inferencia en dispositivo.

El paquete resuelve un problema muy concreto: llevar un modelo conversacional de la familia Gemma 4 a aplicaciones móviles nativas de Apple sin depender de servidores. Para ello entrega un único programa MLX (`mlx/gemma4_e4b_mlx_int4.pte`) con contexto de 2048 tokens y prefill en bloques de 64, junto con el tokenizador de HuggingFace. Los encoders de audio y visión del modelo base no están incluidos, de modo que la conversión cubre únicamente la modalidad de texto.

El interés actual del repositorio es de nicho pero relevante para el ecosistema on-device: demuestra el flujo de exportación de un modelo Gemma 4 a ExecuTorch/MLX y ofrece un artefacto listo para integrar en apps iOS mediante React Native. No hay información publicada sobre el número de parámetros exacto, los idiomas soportados ni resultados de evaluación, y el repositorio no registra descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (decodificador de texto de google/gemma-4-E4B-it); no se detalla en la información disponible si emplea MoE, atención lineal u otra variante |
| Parámetros totales | no disponible (la nomenclatura «E4B» proviene del modelo base, pero no se especifica el recuento exacto) |
| Parámetros activos | no disponible |
| Longitud de contexto | 2048 tokens (configurada en el programa MLX) |
| Tipos de cuantización | 4 bits en capas lineales (int4); no se documentan otros formatos |
| Idiomas soportados | no disponible (el modelo base es multilingüe según Google, pero la model card no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` con backend MLX (`mlx/gemma4_e4b_mlx_int4.pte`), más `tokenizer.json` y `tokenizer_config.json` |
| Tamaño del repositorio | 9,6 GB |
| Prefill | bloques de 64 tokens |
| Plataforma objetivo | iOS, mediante React Native ExecuTorch (MLX) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de identificarlo como el decodificador de texto de google/gemma-4-E4B-it. Se trata, por tanto, de un transformer decoder de la familia Gemma 4 en su variante E4B, del que no se detallan número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal, decodificación especulativa o mezcla de expertos. Tampoco se especifica el recuento de parámetros totales ni activos.

Respecto al entrenamiento, esta ficha no puede aportar datos: la model card del export no incluye número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO u otra forma de alineación. Esa información correspondería a la ficha del modelo original de Google, que no forma parte de la documentación proporcionada. Lo único documentado sobre el proceso de conversión es el resultado: exportación a ExecuTorch con backend MLX, cuantización int4 de las capas lineales, contexto fijado en 2048 tokens y prefill por bloques de 64, con exclusión explícita de los encoders de audio y visión.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo base es una variante «-it», es decir, ajustada para instrucciones y diálogo.
- Conversaciones multi-turno: la etiqueta `conversational` aparece en los metadatos del repositorio y se conserva el tokenizador original de HuggingFace, lo que permite aplicar la plantilla de chat del modelo base.
- Ejecución en dispositivo (on-device) en iOS: el artefacto está exportado específicamente para React Native ExecuTorch con backend MLX.
- Capacidades de audio y visión: no incluidas en este export; los encoders correspondientes no forman parte del paquete.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso o modo de pensamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada, más allá de lo que herede del modelo base.
- Contexto efectivo: limitado a 2048 tokens por la configuración del programa exportado.

## Casos de uso

- Asistentes conversacionales en apps iOS sin conexión: el `.pte` se puede cargar desde React Native ExecuTorch y mantener diálogos multi-turno en el dispositivo, útil en entornos sin red o con requisitos de privacidad estrictos (los datos no salen del teléfono).
- Procesamiento de texto privado en el ámbito sanitario o legal: al ejecutarse localmente sobre el iPhone, notas, resúmenes o borradores nunca se envían a un servidor, lo que simplifica el cumplimiento de normativas de protección de datos.
- Funciones de redacción y reescritura dentro de una app: resúmenes, corrección de estilo o generación de respuestas cortas en campos de formulario, donde la ventana de 2048 tokens es suficiente para el texto de entrada típico.
- Clasificación y extracción ligera de información: etiquetado de mensajes, detección de intención o extracción de campos en textos breves, aprovechando la inferencia local y el coste marginal cero por petición.
- Prototipado de producto móvil con IA generativa: sirve como artefacto de referencia para validar el flujo de exportación ExecuTorch/MLX antes de decidir una estrategia de despliegue definitiva.
- Modo sin conexión en aplicaciones de campo: herramientas para técnicos, inspectores o personal en movilidad que necesitan asistencia de texto en zonas sin cobertura.
- Juguetes educativos y experiencias interactivas: chatbots con personalidad dentro de una app iOS, donde la latencia local y la ausencia de cuotas de API son ventajas claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y las búsquedas web realizadas no han devuelto documentación técnica relevante sobre este modelo (los resultados obtenidos no guardan relación con el tema). No se dispone tampoco de comparaciones de rendimiento frente al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de aproximadamente 4000 millones de parámetros con capas lineales en int4 requiere del orden de 2 a 3 GB solo para los pesos, más el espacio de trabajo del runtime MLX y la caché KV para 2048 tokens; esta cifra es una estimación, no un dato publicado por el autor.
- GPU recomendadas: no disponible. El artefacto está orientado a hardware Apple en iOS, no a GPU de servidor.
- Compatibilidad con GPU de consumo: el destino principal es el silicio de Apple (A-series y M-series) a través de MLX; no se documenta soporte para GPU NVIDIA o AMD.
- Opciones de despliegue: ExecuTorch con backend MLX en iOS, integrado mediante React Native ExecuTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.pte` no es directamente compatible con esos servidores.
- Latencia y throughput: no disponible. Únicamente se conocen los parámetros de configuración (contexto 2048, prefill en bloques de 64), que condicionan el rendimiento pero no lo cuantifican.
- Almacenamiento: el repositorio ocupa 9,6 GB, aunque el tamaño del `.pte` int4 concreto no se detalla; conviene verificar el tamaño real del fichero antes de planificar la distribución en una app.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable, y la información proporcionada no incluye modelos alternativos evaluados en el mismo escenario. A continuación se ofrece una comparación cualitativa con alternativas habituales de despliegue en dispositivo, marcando como «no disponible» todo lo que no se puede verificar.

| Modelo | Parámetros | Contexto | Formato on-device | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kloodia/gemma-4-e4b-executorch | no disponible (base E4B) | 2048 tokens | ExecuTorch + MLX (iOS) | Apache 2.0 | HuggingFace, 1 like, 0 descargas |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | safetensors (presumiblemente) | no disponible en esta ficha | HuggingFace |
| Exportaciones ExecuTorch de modelos de ~3-4B (por ejemplo, familias Llama o Qwen) | del orden de 3000-4000 millones | variable según export | ExecuTorch (`.pte`) | depende del modelo base | HuggingFace y repositorios de ejemplo |
| Ejecución de Gemma en llama.cpp / Ollama con GGUF | depende del modelo | variable | GGUF | depende del modelo base | amplia, multiplataforma |

La ventaja diferencial de este repositorio es el backend MLX para iOS dentro de React Native; su limitación principal frente a las alternativas GGUF es la falta de soporte multiplataforma y de un ecosistema de servidores de inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta sesgos ni se han publicado evaluaciones de equidad para este export.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluación publicada que lo cuantifique. En producción conviene añadir verificación factual y respuestas de reserva.
- Limitación de contexto: la ventana está fijada en 2048 tokens en el programa exportado, muy por debajo de lo habitual en modelos de nueva generación. Conversaciones o documentos largos requerirán truncado, resumen previo o división en fragmentos.
- Cobertura de modalidades: los encoders de audio y visión del modelo base no están incluidos, así que cualquier caso de uso multimodal queda fuera de alcance con este artefacto.
- Idiomas: no se documenta la lista de idiomas soportados en este export; el comportamiento multilingüe dependerá del modelo base y puede degradarse tras la cuantización int4.
- Efecto de la cuantización: la conversión a 4 bits de las capas lineales suele introducir pérdida de calidad respecto al modelo original. No se han publicado mediciones de esa degradación.
- Licencia: Apache 2.0 en el repositorio de exportación, pero conviene verificar las condiciones del modelo base google/gemma-4-E4B-it, que pueden incluir términos adicionales de uso aceptable no reflejados aquí.
- Plataforma: el artefacto está pensado para iOS con MLX. No es portable directamente a Android, servidores Linux ni navegador sin una nueva exportación.
- Madurez: cero descargas y una única interacción registrada; el repositorio no ofrece garantías de mantenimiento, ni tests, ni versionado más allá de la fecha de actualización.
- Trazabilidad: no se documentan los scripts de conversión ni las versiones exactas de ExecuTorch y MLX utilizadas, lo que dificulta reproducir el export.
- Enlaces de búsqueda: las consultas web realizadas no devolvieron documentación técnica sobre este modelo; los resultados obtenidos eran irrelevantes y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kloodia/gemma-4-e4b-executorch
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Documentación de ExecuTorch: https://pytorch.org/executorch/
- Documentación de MLX: https://ml-explore.github.io/mlx/
- React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/

No se han encontrado otros enlaces relevantes (papers, blogs técnicos, repositorios o demos) en la información disponible.
