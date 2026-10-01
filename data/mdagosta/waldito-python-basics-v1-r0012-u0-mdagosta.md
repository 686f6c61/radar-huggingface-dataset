# mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta` es una exportación de un modelo de lenguaje causal etiquetada por su autor como «OpenWALDO model export». Está publicado en HuggingFace bajo la librería `transformers` y emplea la arquitectura estándar Llama para generación de texto, con un total de 9.541.632 parámetros reales según los pesos en safetensors. Se trata, por tanto, de un modelo de escala muy reducida, tres órdenes de magnitud por debajo de los modelos de propósito general habituales.

Su rasgo diferencial declarado es el tokenizador: utiliza el «schema-1 byte tokenizer» de OpenWALDO, es decir, un tokenizador que opera directamente sobre bytes en lugar de sobre un vocabulario de subpalabras. El repositorio incluye además dos ficheros de inventario, `BOM.json` y `EU-BOM.json`, este último con el mapeo de divulgación de contenido de entrenamiento exigido por el Reglamento europeo de IA para modelos de propósito general (GPAI). Ese detalle sugiere un interés por la trazabilidad y el cumplimiento normativo más que por el rendimiento bruto.

El modelo no declara licencia, idiomas soportados ni longitud de contexto, acumula cero descargas y cero «likes», y su model card se limita a las indicaciones de carga. En el momento de redactar esta ficha no hay resultados de benchmarks publicados, ni documentación sobre el dataset de entrenamiento, lo que limita cualquier evaluación seria a un ejercicio de inspección estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (según model card) |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 byte tokenizer (requiere `trust_remote_code=True`) |
| Libreria de referencia | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0.0 GB (según HuggingFace) |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete usa «the standard Transformers Llama causal-language-model architecture», es decir, un transformer decoder-only con atención causal, sin que se especifiquen número de capas, dimensión oculta, número de cabezas de atención ni estrategia de normalización. Con 9,54 millones de parámetros totales y sin componentes de mezcla de expertos declarados, todo apunta a un modelo denso y de dimensiones muy contenidas, coherente con un experimento de laboratorio más que con un modelo de producción.

La innovación declarada no está en el cuerpo del transformer sino en la entrada: el tokenizador de bytes «schema-1» de OpenWALDO evita el vocabulario de subpalabras y mapea directamente secuencias de bytes, lo que en principio permite procesar cualquier entrada binaria o textual sin tokens fuera de vocabulario, a costa de secuencias más largas para un mismo texto. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de ajuste por instrucciones (SFT, RLHF o DPO) ni sobre la técnica de inicialización. La presencia de `BOM.json` y `EU-BOM.json` es el único indicio de gobernanza de datos, y no aporta detalles cuantitativos en la información disponible.

## Capacidades

- Generación de texto autoregresiva: es la tarea declarada en el `pipeline_tag` (`text-generation`).
- Procesamiento a nivel de byte: al usar un tokenizador de bytes, el modelo puede recibir cualquier secuencia de bytes, incluidos caracteres poco frecuentes, símbolos arbitrarios y potencialmente datos binarios serializados como texto.
- Conversación: el tag `conversational` aparece en los metadatos de HuggingFace, aunque no hay plantilla de chat documentada ni formato de prompt especificado.
- Compatibilidad con endpoints: los tags `text-generation-inference` y `endpoints_compatible` indican que el artefacto está preparado para desplegarse con TGI o en HuggingFace Inference Endpoints.
- Dominio temático: el nombre del repositorio incluye `python-basics`, lo que sugiere un ajuste orientado a conceptos básicos de Python. Es una inferencia a partir del identificador, no un dato confirmado en la model card.
- Llamada a herramientas (tool calling): no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Visión, audio o modalidades adicionales: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

Dado el tamaño del modelo (9,54 M de parámetros), los casos de uso realistas se limitan a experimentación, docencia e integración de infraestructura, no a tareas de calidad en producción.

- Validación de pipelines de inferencia: sirve como modelo de prueba para verificar que un despliegue con TGI, vLLM o Inference Endpoints funciona de extremo a extremo antes de mover un modelo grande. Su tamaño permite iterar en segundos sin coste de GPU significativo.
- Investigación sobre tokenización en bytes: al ser un caso concreto del schema-1 de OpenWALDO, permite reproducir experimentos sobre cómo afecta un tokenizador de bytes a la longitud efectiva de secuencia, al coste de atención y a la robustez frente a entradas fuera de vocabulario.
- Docencia de arquitecturas transformer: con 9,5 M de parámetros y pesos en safetensors, es viable cargarlo en un portátil y trazar activaciones, gradientes o mapas de atención en un aula o un cuaderno interactivo.
- Pruebas de cumplimiento normativo GPAI: los ficheros `EU-BOM.json` y `BOM.json` convierten este repositorio en un ejemplo práctico para estudiar cómo se documenta la divulgación de contenido de entrenamiento exigida por el Reglamento europeo de IA.
- Punto de partida para ajuste fino de bajo coste: su tamaño permite reentrenar o ajustar el modelo completo en una única GPU de consumo e incluso en CPU durante la noche, útil para estudiar dinámicas de sobreajuste en corpus muy pequeños.
- Evaluación de riesgos de `trust_remote_code`: el requisito de cargar el tokenizador con código remoto lo hace adecuado como caso de prueba para políticas internas de seguridad, sandboxing y auditoría de repositorios de terceros en entornos corporativos.
- Inferencia en dispositivos embebidos o sin GPU: por tamaño, puede ejecutarse en una Raspberry Pi o en un contenedor sin acelerador, siempre que el objetivo sea generar texto de baja calidad o probar la integración, no resolver una tarea real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra suite, y no existe ningún informe técnico o entrada de blog asociada que aporte métricas.

## Requisitos de hardware

Los pesos ocupan, según su número de parámetros, aproximadamente:

| Precision | Tamano de pesos (aproximado) |
|---|---|
| FP32 | 38,2 MB (36,4 MiB) |
| FP16 / BF16 | 19,1 MB (18,2 MiB) |
| INT8 | 9,5 MB (9,1 MiB) |
| INT4 | 4,8 MB (4,6 MiB) |

- VRAM estimada para inferencia: inferior a 1 GB en cualquiera de las precisiones anteriores, incluyendo el cache KV, cuyo tamaño exacto no puede calcularse al desconocerse el número de capas, cabezas y la longitud de contexto.
- GPU recomendadas: cualquier GPU sirve; el modelo no necesita A100, H100 ni siquiera una RTX 4090. Una GTX 1050, una iGPU o una NPU de bajo consumo son suficientes.
- Cabe en GPU de consumo: sí, en todas las gamas, incluidas tarjetas con 2 GB de VRAM. También cabe en memoria unificada de placas tipo Raspberry Pi 4/5 o en un contenedor sin GPU.
- Opciones de despliegue: `transformers` con Python es la vía documentada, y el tokenizador requiere `trust_remote_code=True`. Los tags indican compatibilidad con text-generation-inference y con los endpoints de HuggingFace. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada en el repositorio. vLLM no está verificado y dependería de la implementación exacta del tokenizador remoto.
- Latencia y throughput: no disponible. No se han publicado mediciones, y sin conocer la profundidad de la red ni el número de capas no es posible estimar tokens por segundo de forma defendible.

## Comparativa con modelos similares

No hay en la información proporcionada ningún modelo comparable publicado por el mismo autor ni una familia de referencia de OpenWALDO. A continuación se comparan dos alternativas públicas de la misma categoría de tamaño, con la advertencia de que sus cifras proceden de fuentes públicas generales y no de la información de esta búsqueda, por lo que conviene verificarlas antes de citarlas.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0012-u0-mdagosta | 9,54 M | no disponible | no disponible | no disponible | safetensors en HuggingFace; 0 descargas |
| TinyStories-8M (Eldan y Li) | ~8 M | no disponible | no disponible en esta ficha | ingles | pesos publicos en HuggingFace |
| TinyStories-28M (Eldan y Li) | ~28 M | no disponible | no disponible en esta ficha | ingles | pesos publicos en HuggingFace |
| TinyLlama-1.1B | ~1,1 B | 2048 tokens | Apache 2.0 | ingles (principalmente) | pesos publicos, amplia adopcion |

La diferencia fundamental frente a TinyLlama-1.1B es de dos órdenes de magnitud en parámetros y de una en contexto, además de una licencia claramente declarada. Frente a las variantes TinyStories, la comparación es más razonable en escala, pero no hay ninguna métrica común publicada para el modelo OpenWALDO que permita afirmar cuál rinde mejor.

## Limitaciones y advertencias

- Capacidad muy limitada: con 9,54 M de parámetros no cabe esperar razonamiento, coherencia multi-turno ni conocimiento factual fiable. Cualquier uso en producción orientado a usuario final produciría resultados inservibles.
- Alucinación: el riesgo es extremo. Un modelo de este tamaño, sin datos de entrenamiento documentados, generará texto plausible pero no veraz con alta probabilidad.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial, modificación ni redistribución. En la práctica, esto equivale a reserva de derechos por defecto en muchas jurisdicciones, lo que lo inhabilita para integraciones comerciales sin contacto previo con el autor.
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma, ni de que el tokenizador de bytes produzca segmentaciones eficientes en textos no ingleses.
- Longitud de contexto desconocida: no puede planificarse ningún caso de uso que dependa de ventanas largas.
- Riesgo de seguridad por `trust_remote_code=True`: la carga del tokenizador implica ejecutar código Python proporcionado por el autor del repositorio. En un entorno corporativo esto debe hacerse siempre en un sandbox aislado, con revisión previa del código y sin acceso a credenciales ni a la red.
- Ausencia de validación externa: cero descargas, cero likes, sin benchmarks, sin informes de terceros. No existe ninguna señal independiente de calidad o de funcionamiento correcto.
- Trazabilidad incompleta: aunque el repositorio incluye ficheros de inventario (`BOM.json`, `EU-BOM.json`), su contenido no se ha detallado en la información disponible, por lo que no puede auditarse la composición real del dataset de entrenamiento.
- Fecha de creación atípica: el repositorio figura creado el 30 de septiembre de 2026, posterior a la fecha habitual de publicación de modelos comparables. Conviene verificar la coherencia de los metadatos antes de referenciarlo.
- Estado del repositorio: el tamaño declarado es 0.0 GB pese a contener pesos de 9,54 M de parámetros, lo que puede indicar un problema de empaquetado o de cálculo de metadatos. Verificar la integridad de los ficheros antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u0-mdagosta
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Fichero de inventario de release (referenciado en la model card, sin URL directa): `BOM.json` en el repositorio
- Fichero de divulgación GPAI de la UE (referenciado en la model card, sin URL directa): `EU-BOM.json` en el repositorio
- Paper, blog, repositorio de código o demo: no disponible
